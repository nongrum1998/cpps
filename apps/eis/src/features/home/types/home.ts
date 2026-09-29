import { LeaveStatusI, LeaveTypeCode } from '@sharedTypes/leave';

export type HomeNotificationType = {
  announce_dt: string;
  body: string;
  message: string;
  status: string;
  title: string;
  type: string;
};

export type HomeLeaveT = {
  from_dt: string;
  leave_cd: LeaveTypeCode;
  leave_desc: string;
  no_days: string;
  order_dt: string;
  reason_for_leave: string;
  to_dt: string;
  verify_flg_desc: LeaveStatusI;
};

export type HomeOverviewT = {
  all_notification: HomeNotificationType[];
  latest_leave: HomeLeaveT | null;
  notification_for_me: HomeNotificationType | null;
};
