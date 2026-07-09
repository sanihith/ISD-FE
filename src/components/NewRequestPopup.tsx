import { useState, useEffect, memo, type ChangeEvent } from 'react';
import {
  Dialog, DialogContent, Box, Typography, TextField, Button,
  IconButton, Tooltip, Chip, MenuItem, Select, FormControl,
  useMediaQuery, useTheme, CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  Subject as SubjectIcon,
  Description as DescriptionIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

interface NewRequestPopupProps {
  open: boolean;
  onClose: () => void;
  initialAssignedToEmail?: string;
}

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Todo', color: 'var(--accent)' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b' },
  { value: 'COMPLETED', label: 'Completed', color: 'var(--success)' },
  { value: 'REJECTED', label: 'Rejected', color: 'var(--error)' },
];

const INITIAL_STATE = {
  subject: '',
  explanation: '',
  assignedToEmail: '',
  additionalCcEmails: '',
  requestedByDate: '',
  status: 'OPEN'
};

const NewRequestPopup = ({ open, onClose, initialAssignedToEmail }: NewRequestPopupProps) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState(INITIAL_STATE);

  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        assignedToEmail: initialAssignedToEmail || '',
        additionalCcEmails: ''
      }));
    }
  }, [open, user, initialAssignedToEmail]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.assignedToEmail) {
      alert('Please fill in Subject and To (recipient)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/requests', {
        subject: formData.subject,
        explanation: formData.explanation,
        assignedToEmail: formData.assignedToEmail,
        requestedByDate: formData.requestedByDate,
        status: formData.status,
        createdById: user?.id,
        ccEmails: formData.additionalCcEmails ? formData.additionalCcEmails.split(',').map((e: string) => e.trim()).filter((e: string) => e) : []
      });

      const requestId = response.data.id;

      if (files.length > 0) {
        for (const file of files) {
          const uploadData = new FormData();
          uploadData.append('file', file);
          uploadData.append('requestId', requestId.toString());
          await apiClient.post('/attachments/upload', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }

      onClose();
      setFormData(INITIAL_STATE);
      setFiles([]);
    } catch (error) {
      console.error('Failed to create request:', error);
      alert('Failed to create request. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: '#fff',
      fontSize: '0.9rem',
      transition: 'all 0.2s',
      '& fieldset': { borderColor: 'var(--border)' },
      '&:hover fieldset': { borderColor: 'var(--accent)' },
      '&.Mui-focused fieldset': { borderColor: 'var(--accent)', borderWidth: '2px' }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 4,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }
      }}
    >
      {/* ── Premium gradient header ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        px: 3,
        py: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            Create New Task
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
            Fill in the details below to assign a new task
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: isMobile ? '100%' : '72vh', overflow: 'auto', bgcolor: '#f8fafc' }}>
        {/* ── Form fields ── */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* From (read-only) */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            bgcolor: 'rgba(37, 99, 235, 0.04)', borderRadius: 2.5, px: 2, py: 1.5,
            border: '1px solid rgba(37, 99, 235, 0.1)'
          }}>
            <PersonIcon sx={{ fontSize: 18, color: 'var(--accent)' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>From</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-h)', fontSize: '0.85rem' }}>{user?.email}</Typography>
            </Box>
          </Box>

          {/* To */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <PersonIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                To *
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="recipient@email.com"
              value={formData.assignedToEmail}
              onChange={(e) => setFormData({ ...formData, assignedToEmail: e.target.value })}
              sx={inputSx}
            />
          </Box>

          {/* Cc */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <GroupIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                Cc
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Comma-separated email addresses"
              value={formData.additionalCcEmails}
              onChange={(e) => setFormData({ ...formData, additionalCcEmails: e.target.value })}
              sx={inputSx}
            />
          </Box>

          {/* Subject */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <SubjectIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                Subject *
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="What is this task about?"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              sx={{
                ...inputSx,
                '& .MuiOutlinedInput-root': {
                  ...inputSx['& .MuiOutlinedInput-root'],
                  '& input': { fontWeight: 600 }
                }
              }}
            />
          </Box>

          {/* Due Date & Status row */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <DateRangeIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Due Date
                </Typography>
              </Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formData.requestedByDate ? dayjs(formData.requestedByDate) : null}
                  onChange={(newValue) => setFormData({ ...formData, requestedByDate: newValue ? newValue.format('YYYY-MM-DD') : '' })}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      sx: inputSx
                    }
                  } as any}
                />
              </LocalizationProvider>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_OPTIONS.find(s => s.value === formData.status)?.color }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Status
                </Typography>
              </Box>
              <FormControl size="small" fullWidth>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: '#fff',
                    fontSize: '0.9rem',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent)', borderWidth: '2px' }
                  }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.color }} />
                        {opt.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Description */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <DescriptionIcon sx={{ fontSize: 16, color: 'var(--accent)' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                Description
              </Typography>
            </Box>
            <TextField
              multiline
              fullWidth
              rows={isMobile ? 5 : 8}
              placeholder="Provide details about the task..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              sx={{
                ...inputSx,
                '& .MuiOutlinedInput-root': {
                  ...inputSx['& .MuiOutlinedInput-root'],
                  alignItems: 'flex-start'
                }
              }}
            />
          </Box>

          {/* Attachments display */}
          {files.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((file, index) => (
                <Chip
                  key={index}
                  icon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                  label={`${file.name.length > 25 ? file.name.slice(0, 25) + '...' : file.name} (${(file.size / 1024).toFixed(0)} KB)`}
                  onDelete={() => removeFile(index)}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    color: 'var(--text-h)',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    '& .MuiChip-deleteIcon': { color: 'var(--text-muted)', '&:hover': { color: 'var(--error)' } }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* ── Bottom action bar ── */}
        <Box sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border)',
          bgcolor: '#fff',
          mt: 'auto'
        }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.subject || !formData.assignedToEmail}
              sx={{
                borderRadius: 2.5,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
                  transform: 'translateY(-1px)'
                },
                '&.Mui-disabled': {
                  background: 'var(--border)',
                  boxShadow: 'none'
                }
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>

            <Tooltip title="Attach files">
              <IconButton
                component="label"
                sx={{
                  color: 'var(--text-muted)',
                  bgcolor: 'var(--accent-bg)',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'var(--accent)', color: '#fff' }
                }}
              >
                <input type="file" hidden multiple onChange={handleFileChange} />
                <AttachFileIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {files.length > 0 && (
              <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                {files.length} file{files.length > 1 ? 's' : ''} attached
              </Typography>
            )}
          </Box>

          <Button
            variant="text"
            onClick={onClose}
            sx={{
              textTransform: 'none',
              color: 'var(--text-muted)',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
            }}
          >
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default memo(NewRequestPopup);