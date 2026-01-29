// components/modal/NotificationToast.jsx
const NotificationToast = ({ show, message }) => {
  if (!show) return null;

  return (
    <div className="fixed left-[260px] bottom-10 z-50">
      <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg">
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default NotificationToast;
