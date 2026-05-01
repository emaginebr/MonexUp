import { useEffect, useState } from "react";
import moment from "moment";

type Props = {
  children: string | Date | number | undefined | null;
  format?: string;
  fromNow?: boolean;
  ago?: boolean;
  interval?: number;
};

export default function Moment({
  children,
  format,
  fromNow,
  ago,
  interval,
}: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!interval || interval <= 0) return;
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  if (children == null || children === "") return null;
  const m = moment(children as moment.MomentInput);
  if (!m.isValid()) return null;

  let out: string;
  if (fromNow) {
    out = m.fromNow(ago === true);
  } else if (format) {
    out = m.format(format);
  } else {
    out = m.format();
  }
  return <>{out}</>;
}
