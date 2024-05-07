import React, { DetailedHTMLProps, HTMLAttributes } from "react";

type LinkType = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const Link: React.FC<LinkType> = (props: LinkType) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={`cursor-pointer text-blue-600 inline hover:underline ${
        className ?? ""
      }`}
      {...rest}
    >
      {children}
    </div>
  );
};
