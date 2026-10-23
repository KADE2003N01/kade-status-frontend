import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../services/api.js';
import { getStoredSessionToken } from '../services/adminSession.js';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024;
const MIME_BY_EXTENSION = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
  pdf: 'application/pdf', txt: 'text/plain', csv: 'text/csv', zip: 'application/zip', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

function normalizedType(file) {
  if (file.type) return file.type.toLowerCase().split(';')[0].trim();
  const ext = file.name.split('.').pop()?.toLowerCase();
  return MIME_BY_EXTENSION[ext] || '';
}

export async function uploadMessageAttachment(file) {
  const token = getStoredSessionToken();
  const response = await apiFetch('/messages/attachments', {
    method: 'POST', credentials: 'include',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
      'X-File-Type': normalizedType(file),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: file
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Could not upload ${file.name}.`);
  return result.attachment;
}

export async function discardMessageAttachments(ids) {
  const token = getStoredSessionToken();
  await Promise.all(ids.map(async (id) => {
    const response = await apiFetch(`/messages/attachments/${id}`, {
      method: 'DELETE', credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok && response.status !== 404) throw new Error('Could not remove an unused attachment.');
  }));
}

function AuthenticatedAttachment({ attachment }) {
  const isVoiceNote = attachment.mimeType.startsWith('audio/') && /^voice message\b/i.test(attachment.name || '');
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [requested, setRequested] = useState(isVoiceNote);
  useEffect(() => {
    if (!requested) return undefined;
    let active = true;
    let objectUrl = '';
    const token = getStoredSessionToken();
    apiFetch(attachment.url, { credentials: 'include', allowBinary: true, headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (response) => {
        if (!response.ok) throw new Error('Attachment unavailable.');
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (active) setUrl(objectUrl);
      })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [attachment.id, attachment.url, requested]);

  if (error) return <span className="message-attachment-unavailable">Attachment unavailable</span>;
  if (!requested) return <button type="button" className="message-attachment-open" onClick={() => setRequested(true)}><i className={`fas ${attachment.mimeType.startsWith('audio/') ? 'fa-volume-high' : attachment.mimeType.startsWith('video/') ? 'fa-video' : attachment.mimeType.startsWith('image/') ? 'fa-image' : 'fa-paperclip'}`} /> {attachment.mimeType.startsWith('image/') ? 'View' : attachment.mimeType.startsWith('audio/') ? 'Play' : attachment.mimeType.startsWith('video/') ? 'Play' : 'Download'} {attachment.name}</button>;
  if (!url) return <span className="message-attachment-loading">Loading {attachment.name}…</span>;
  if (attachment.mimeType.startsWith('image/')) return <a className="message-attachment-image" href={url} target="_blank" rel="noreferrer"><img src={url} alt={attachment.name} /></a>;
  if (attachment.mimeType.startsWith('video/')) return <video className="message-attachment-media" src={url} controls preload="metadata" aria-label={attachment.name} />;
  if (attachment.mimeType.startsWith('audio/')) return <div className="message-attachment-audio"><audio className="message-attachment-media" src={url} controls preload="metadata" aria-label={attachment.name} onError={() => setPlaybackError(true)} />{playbackError && <small className="message-attachment-playback-error">This browser could not play the recording. Download it to listen in another player.</small>}<a className="message-attachment-file" href={url} download={attachment.name}><i className="fas fa-download" /> Download audio</a></div>;
  return <a className="message-attachment-file" href={url} download={attachment.name}><i className="fas fa-paperclip" /> {attachment.name}</a>;
}

export function MessageAttachmentList({ attachments = [] }) {
  if (!attachments.length) return null;
  return <div className="message-attachment-list">{attachments.map((attachment) => <AuthenticatedAttachment key={attachment.id} attachment={attachment} />)}</div>;
}

function PendingAttachmentPreview({ file, disabled, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [playbackError, setPlaybackError] = useState(false);
  useEffect(() => {
    if (!file.type.startsWith('audio/')) return undefined;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return <div className="message-attachment-pending-item">
    <span className="message-attachment-pending"><i className={`fas ${file.type.startsWith('audio/') ? 'fa-volume-high' : file.type.startsWith('video/') ? 'fa-video' : file.type.startsWith('image/') ? 'fa-image' : 'fa-paperclip'}`} /> {file.name}<button type="button" aria-label={`Remove ${file.name}`} disabled={disabled} onClick={onRemove}><i className="fas fa-xmark" /></button></span>
    {previewUrl && <><audio className="message-attachment-pending-audio" controls preload="metadata" src={previewUrl} aria-label={`Preview ${file.name}`} onError={() => setPlaybackError(true)} />{playbackError && <small className="message-attachment-playback-error">This browser cannot preview this audio format.</small>}</>}
  </div>;
}

export function MessageAttachmentPicker({ files, onFilesChange, disabled, onError }) {
  const inputRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function addFiles(fileList) {
    const added = Array.from(fileList || []);
    const tooLarge = added.find((file) => file.size > MAX_FILE_SIZE);
    if (tooLarge) { onError(`${tooLarge.name} is larger than 50 MB.`); return; }
    if (files.length + added.length > 10) { onError('Attach up to 10 files to one message.'); return; }
    if ([...files, ...added].reduce((total, file) => total + file.size, 0) > MAX_TOTAL_SIZE) { onError('Attachments together must be 100 MB or smaller.'); return; }
    onFilesChange((current) => [...current, ...added]);
    onError('');
  }

  async function toggleRecording() {
    if (recording) { recorderRef.current?.stop(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      onError('Voice recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const type = (recorder.mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();
        const extension = type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'webm';
        const voiceFile = new File(chunksRef.current, `Voice message ${new Date().toLocaleString().replace(/[\\/:]/g, '-')}.${extension}`, { type });
        if (voiceFile.size) addFiles([voiceFile]);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
      };
      recorder.start();
      setRecording(true);
      onError('');
    } catch {
      onError('Microphone access was not granted. Allow microphone access and try again.');
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  return <div className="message-attachment-picker">
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/ogg,audio/webm,audio/flac,application/pdf,text/plain,text/csv,application/zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx" multiple hidden disabled={disabled} onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
    <button type="button" className="message-attachment-action" disabled={disabled || recording} onClick={() => inputRef.current?.click()}><i className="fas fa-paperclip" /> Attach files</button>
    <button type="button" className={`message-attachment-action${recording ? ' is-recording' : ''}`} disabled={disabled} onClick={toggleRecording}><i className={`fas ${recording ? 'fa-stop' : 'fa-microphone'}`} /> {recording ? 'Stop recording' : 'Record voice'}</button>
    {files.map((file, index) => <PendingAttachmentPreview key={`${file.name}-${file.lastModified}-${index}`} file={file} disabled={disabled || recording} onRemove={() => onFilesChange((current) => current.filter((_, itemIndex) => itemIndex !== index))} />)}
  </div>;
}
