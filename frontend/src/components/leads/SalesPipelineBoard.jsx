import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { FaFire, FaWhatsapp } from 'react-icons/fa';
import api from '../../admin/utils/api';

const STAGES = [
  { id: 'new_lead', title: 'ליד חדש' },
  { id: 'contacted', title: 'יצרנו קשר' },
  { id: 'engaged', title: 'מעורבות' },
  { id: 'meeting_set', title: 'פגישה נקבעה' },
  { id: 'proposal_sent', title: 'הצעה נשלחה' },
  { id: 'won', title: 'נסגר' },
  { id: 'lost', title: 'הפסדנו' },
];

function buildEmptyColumns() {
  return Object.fromEntries(STAGES.map((s) => [s.id, []]));
}

function normalizePhoneForWhatsApp(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  // ישראל: אם מתחיל ב-0, נחליף ל-972
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  // אם כבר בינלאומי
  if (digits.startsWith('972')) return digits;

  return digits;
}

function getClientDisplayName(client) {
  return client?.personalInfo?.fullName || 'ללא שם';
}

function getBusinessName(client) {
  return client?.businessInfo?.businessName || '';
}

function getClientScore(client) {
  const score = client?.leadScore ?? client?.score;
  return typeof score === 'number' ? score : null;
}

export default function SalesPipelineBoard() {
  const [columns, setColumns] = useState(buildEmptyColumns);
  const [loading, setLoading] = useState(true);

  const stageMeta = useMemo(() => Object.fromEntries(STAGES.map((s) => [s.id, s])), []);

  useEffect(() => {
    let mounted = true;

    async function fetchClients() {
      setLoading(true);
      try {
        const res = await api.get('/clients', {
          params: {
            // מביא רק את הסטטוסים של ה-Pipeline כדי לצמצם רעש
            status: STAGES.map((s) => s.id).join(','),
            limit: 200,
          },
        });

        const clients = res?.data?.data || [];
        const next = buildEmptyColumns();

        for (const client of clients) {
          const status = stageMeta[client.status] ? client.status : 'new_lead';
          next[status].push(client);
        }

        if (mounted) setColumns(next);
      } catch (e) {
        console.error('Failed to fetch clients for pipeline:', e);
        toast.error('שגיאה בטעינת ה-Pipeline');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchClients();
    return () => {
      mounted = false;
    };
  }, [stageMeta]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sameColumn = source.droppableId === destination.droppableId;
    const sameIndex = source.index === destination.index;
    if (sameColumn && sameIndex) return;

    const prevColumns = columns;

    const nextColumns = (() => {
      const next = { ...prevColumns };
      const sourceList = Array.from(next[source.droppableId] || []);
      const [moved] = sourceList.splice(source.index, 1);

      if (!moved) return prevColumns;

      if (sameColumn) {
        sourceList.splice(destination.index, 0, moved);
        next[source.droppableId] = sourceList;
        return next;
      }

      const destList = Array.from(next[destination.droppableId] || []);
      const movedUpdated = { ...moved, status: destination.droppableId };
      destList.splice(destination.index, 0, movedUpdated);

      next[source.droppableId] = sourceList;
      next[destination.droppableId] = destList;

      return next;
    })();

    setColumns(nextColumns);

    // שליחת עדכון רק אם עברנו עמודה
    if (!sameColumn) {
      try {
        await api.patch(`/clients/${draggableId}`, { status: destination.droppableId });
      } catch (e) {
        console.error('Failed to update client status:', e);
        toast.error('לא הצלחתי לעדכן סטטוס. מחזיר אחורה...');
        setColumns(prevColumns);
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Sales Pipeline
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          גרור לידים בין שלבים כדי לעדכן סטטוס.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
            }}
          >
            {STAGES.map((stage) => {
              const items = columns[stage.id] || [];

              return (
                <Paper
                  key={stage.id}
                  elevation={0}
                  sx={{
                    minWidth: 280,
                    width: 300,
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 210px)',
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{stage.title}</Typography>
                    <Chip size="small" label={items.length} />
                  </Box>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          p: 1.5,
                          flex: 1,
                          overflowY: 'auto',
                          backgroundColor: snapshot.isDraggingOver ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                          transition: 'background-color 120ms ease',
                        }}
                      >
                        {items.map((client, index) => {
                          const score = getClientScore(client);
                          const isHot = typeof score === 'number' && score >= 80;
                          const waPhone = normalizePhoneForWhatsApp(
                            client?.personalInfo?.whatsappPhone || client?.personalInfo?.phone
                          );

                          return (
                            <Draggable key={client._id} draggableId={String(client._id)} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <Paper
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  elevation={0}
                                  sx={{
                                    p: 1.25,
                                    mb: 1.25,
                                    borderRadius: 2,
                                    border: '1px solid rgba(0,0,0,0.10)',
                                    backgroundColor: dragSnapshot.isDragging ? '#fafafa' : '#fff',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                                        {getClientDisplayName(client)}
                                      </Typography>
                                      {!!getBusinessName(client) && (
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                          {getBusinessName(client)}
                                        </Typography>
                                      )}
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                      {isHot && (
                                        <Tooltip title="ליד חם">
                                          <Box sx={{ color: '#f44336', display: 'flex', alignItems: 'center' }}>
                                            <FaFire />
                                          </Box>
                                        </Tooltip>
                                      )}

                                      {waPhone && (
                                        <Tooltip title="פתח WhatsApp">
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(`https://wa.me/${waPhone}`, '_blank', 'noopener,noreferrer');
                                            }}
                                          >
                                            <FaWhatsapp />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </Box>

                                  <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                    {typeof score === 'number' && (
                                      <Chip size="small" label={`Score: ${score}`} variant="outlined" />
                                    )}
                                    {client?.leadSource && (
                                      <Chip size="small" label={client.leadSource} variant="outlined" />
                                    )}
                                  </Box>
                                </Paper>
                              )}
                            </Draggable>
                          );
                        })}

                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              );
            })}
          </Box>
        </DragDropContext>
      )}
    </Box>
  );
}
