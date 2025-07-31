import { User } from "./user";

export interface Event {
    name:           string;
    description:    string;
    latitude:       string;
    longitude:      string;
    address:        string;
    allowed_radius: string;
    start_time:     Date;
    end_time:       Date;
    user_id:        number;
    qr_code:        string;
    updated_at:     Date;
    created_at:     Date;
    id:             number;
    user:           User;
}