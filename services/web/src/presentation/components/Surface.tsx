function Surface({
  children,
  className,
  actionComponent,
}: {
  children: React.ReactNode;
  className?: string;
  actionComponent?: React.ReactNode;
}) {
  const additionalClassName = className || "";

  return (
    <div
      className={`bg-neutral-100 rounded-lg md:shadow-sm md:shadow-shadow-75 overflow-hidden ${additionalClassName}`}
    >
      {children}
      {actionComponent && (
        <div className="absolute bottom-0 left-0 right-0 rounded-lg flex justify-start">
          <div className="flex flex-col w-full">
            <div className="w-full h-xxs bg-linear-to-t from-neutral-100 to-[#0000]" />
            <div className="pb-m pt-s px-l bg-neutral-100 rounded-l">
              {actionComponent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Surface;
