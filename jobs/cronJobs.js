const cron = require('node-cron');
const { deactivateExpiredEvents } = require('../controllers/eventController');
const { deactivateOldNotices } = require('../controllers/noticeController');

const startCronJobs = () => {
  cron.schedule('0 0 * * *', () => {
    console.log('Iniciando tarefa de inativação de eventos vencidos...');
    deactivateExpiredEvents();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });

  cron.schedule('0 0 * * *', () => {
    console.log('Iniciando tarefa de inativação de avisos vencidos...');
    deactivateOldNotices();
  }, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
  });
};

module.exports = { startCronJobs };