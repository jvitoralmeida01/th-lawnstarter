export interface QueryEvent {
  path: string;
  route: string;
  ms: number;
  source?: string;
  occurred_at?: string;
}
