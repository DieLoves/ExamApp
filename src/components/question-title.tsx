import { Fragment } from "react";

interface QuestionTitleProps {
  title: string;
}

export function QuestionTitle({ title }: QuestionTitleProps) {
  const lines = title.split("\n").map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < title.split("\n").length - 1 && <br />}
    </Fragment>
  ));

  return <div>{lines}</div>;
}
