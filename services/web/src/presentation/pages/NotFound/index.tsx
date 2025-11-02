import EmptySearchImage from "../../assets/EmptySearch.png";

function NotFoundPage() {
  return (
    <div className="flex flex-col gap-m items-center justify-center min-h-full">
      <img
        src={EmptySearchImage}
        alt="Empty search"
        draggable="false"
        className="w-80 h-80 object-contain"
      />
      <div className="flex flex-col gap-xxs items-center text-subtitle font-bold whitespace-pre-line">
        <span className="text-neutral-500">404</span>
        <br />
        <span className="text-neutral-400">Nothing to see here...</span>
      </div>
    </div>
  );
}

export default NotFoundPage;
