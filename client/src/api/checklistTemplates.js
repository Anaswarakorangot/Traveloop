import client from './client'

export const checklistTemplatesApi = {
  getTemplates: () => client.get('/checklist/templates'),
  getTemplate: (id) => client.get(`/checklist/templates/${id}`),
  applyTemplate: (templateId, tripId) => client.post(`/checklist/templates/${templateId}/apply/${tripId}`),
}
