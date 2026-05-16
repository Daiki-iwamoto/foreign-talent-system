import type { CandidateStatus } from "@/lib/status";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string;
          full_name: string;
          nationality: string | null;
          date_of_birth: string | null;
          gender: string | null;
          email: string | null;
          phone: string | null;
          industry: string | null;
          job_title: string | null;
          work_history: string | null;
          education: string | null;
          current_status: CandidateStatus;
          memo: string | null;
          pdf_file_path: string;
          ocr_raw_text: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          nationality?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          email?: string | null;
          phone?: string | null;
          industry?: string | null;
          job_title?: string | null;
          work_history?: string | null;
          education?: string | null;
          current_status?: CandidateStatus;
          memo?: string | null;
          pdf_file_path: string;
          ocr_raw_text?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          nationality?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          email?: string | null;
          phone?: string | null;
          industry?: string | null;
          job_title?: string | null;
          work_history?: string | null;
          education?: string | null;
          current_status?: CandidateStatus;
          memo?: string | null;
          pdf_file_path?: string;
          ocr_raw_text?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      status_history: {
        Row: {
          id: string;
          candidate_id: string;
          from_status: CandidateStatus | null;
          to_status: CandidateStatus;
          changed_by: string | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          from_status?: CandidateStatus | null;
          to_status: CandidateStatus;
          changed_by?: string | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          from_status?: CandidateStatus | null;
          to_status?: CandidateStatus;
          changed_by?: string | null;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      candidate_status: CandidateStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Json_ = Json;

export type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
export type StatusHistory = Database["public"]["Tables"]["status_history"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type StatusHistoryWithUser = StatusHistory & {
  changed_by_profile: Pick<Profile, "name" | "email"> | null;
};
