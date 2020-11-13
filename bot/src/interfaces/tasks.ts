export interface RawTask {
  name: string;
  time: string;
}

export interface FormatedDate {
  day: string;
  month: string;
  year: string;
}

export interface Task {
  name: string;
  date: FormatedDate;
}
