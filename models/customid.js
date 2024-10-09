const Counter = require('./counter.model')

async function generateCustomId(entityPrefix) {
  const counter = await Counter.findOneAndUpdate(
    { entity: entityPrefix },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }  
  );
  const id = `${entityPrefix}${String(counter.seq).padStart(3, '0')}`;
  return id;
}

module.exports = { generateCustomId };
