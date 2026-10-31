import type { People } from "@/types/reservation";

// 文字数・件数・CSV・記録の上限（数字はここと lessons.ts にだけ書く）
export const NAME_MAX = 30;
export const EMAIL_MAX = 100;
export const PHONE_MAX = 13;
export const PHONE_DIGITS_MIN = 10;
export const PHONE_DIGITS_MAX = 11;
export const REQUEST_MAX = 200;
export const MEMO_MAX = 500;
export const SEARCH_MAX = 30;
export const ID_MAX = 64;

export const RESERVATIONS_MAX = 300;
export const HISTORY_MAX = 50;

export const CSV_MAX_BYTES = 1024 * 1024;
export const CSV_MAX_ROWS = 1000;

export const PEOPLE_OPTIONS: readonly People[] = [1, 2, 3, 4];
// 読み込めない行を1行ずつ見せる数（21件目からは「ほか{k}行」）
export const CSV_ERRORS_SHOWN = 20;
