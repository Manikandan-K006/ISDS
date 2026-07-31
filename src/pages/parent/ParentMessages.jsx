import Messages from '../shared/Messages';

export default function ParentMessages() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-page-title theme-text">Messages</h1>
        <p className="theme-text-muted mt-1">Communicate with teachers and administrators</p>
      </div>
      <Messages />
    </div>
  );
}
