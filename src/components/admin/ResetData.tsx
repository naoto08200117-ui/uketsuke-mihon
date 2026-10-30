"use client";

import { useEffect, useRef, useState } from "react";
import { SEED_RESERVATIONS } from "@/lib/seed";
import { updateReservations } from "@/lib/reservationStorage";
import { secondaryButtonClass } from "@/components/form/Field";

// F10：架空のデータに戻す。確認は confirm() を使わず画面内で行う（A-10）。赤いボタンにしない
export default function ResetData({ onReset }: { onReset: (message: string) => void }) {
  const [asking, setAsking] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const wasAsking = useRef(false);

  // 確認を出したら「やめる」に、閉じたら元のボタンにフォーカスを移す（キーボードで迷わないように）
  useEffect(() => {
    if (asking) cancelRef.current?.focus();
    else if (wasAsking.current) openRef.current?.focus();
    wasAsking.current = asking;
  }, [asking]);

  function reset() {
    // 丸ごと置き換えるので、読み直しても結果は同じ。覚えておいた seed を壊さないよう新しい配列で渡す
    updateReservations(() => [...SEED_RESERVATIONS]);
    setAsking(false);
    onReset("架空の10件に戻しました。");
  }

  if (!asking) {
    return (
      <div>
        <button ref={openRef} type="button" onClick={() => setAsking(true)} className={secondaryButtonClass}>
          架空のデータに戻す
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-body text-ink">今のデータを消して、最初の架空の10件に戻します。元に戻せません。</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={secondaryButtonClass}>
          戻す
        </button>
        <button ref={cancelRef} type="button" onClick={() => setAsking(false)} className={secondaryButtonClass}>
          やめる
        </button>
      </div>
    </div>
  );
}
