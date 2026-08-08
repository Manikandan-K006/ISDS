import Messages from '../shared/Messages';

export default function TeacherMessages() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-page-title theme-text">Messages</h1>
        <p className="theme-text-muted mt-1">Communicate with students and parents</p>
      </div>
      <Messages />
    </div>
  );
}
