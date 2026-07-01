export interface User {
  id: number;
  // Aliased fields returned by the backend (see User.getName/getEmail/getEmployeeId)
  employeeId?: string;
  name?: string;
  email?: string;
  // Raw JPA property names; older deployments of the backend omit the aliased
  // fields above and expose only these. Optional so we degrade gracefully.
  employeeName?: string;
  officialEmail?: string;
  employeeCode?: string;
  managerId?: number;
  role: string;
}

export interface Request {
  id: number;
  subject: string;
  explanation: string;
  createdBy: User;
  assignedTo?: User;
  requestedByDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  ccUsers?: User[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
}