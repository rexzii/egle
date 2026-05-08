// attendance-record.interface.ts
export interface AttendanceRecord {
    username: string;
    date: Date;
    time: Date;
    location: string;
    coordinates: string;
    stop_date: Date;
    stop_time: Date;
}
