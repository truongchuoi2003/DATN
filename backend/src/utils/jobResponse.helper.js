const serializeJobForClient = (job) => {
  if (!job) return job;

  const jobObj =
    typeof job.toObject === 'function'
      ? job.toObject({ virtuals: true })
      : { ...job };

  if (job.recommendation !== undefined) {
    jobObj.recommendation = job.recommendation;
  }

  return jobObj;
};

const serializeJobListForClient = (jobs = []) => {
  return Array.isArray(jobs) ? jobs.map(serializeJobForClient) : [];
};

module.exports = {
  serializeJobForClient,
  serializeJobListForClient,
};