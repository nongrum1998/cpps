import { LoginT } from './login';

export interface UserT extends LoginT {
  ppo_no: string;
  phone_no?: string;
  organization?: string;
}
