export interface RemoteItem {
  id: string;
  type: string;
  label: string;
  gridX: number;
  gridY: number;
  colSpan: number;
  rowSpan: number;
  shape?: { x: number; y: number }[];
}

export interface Remote {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  device_type?: string;
  brand?: string;
  model?: string;
  layout: {
    items: RemoteItem[];
  };
  created_at: string;
  updated_at: string;
}

export interface RemoteButton {
  id: string;
  remote_id: string;
  button_id: string;
  button_type: string;
  hex_code?: string;
  protocol?: string;
  frequency?: number;
}
