const { PAGINATION } = require('../../constants');

/**
 * BaseRepository - Generic implementation for common DB operations
 * All repositories extend this class
 */
class BaseRepository {
  /**
   * @param {mongoose.Model} model - The Mongoose model
   */
  constructor(model) {
    this._model = model;
  }

  async findById(id, populate = []) {
    let query = this._model.findById(id);
    populate.forEach((p) => query.populate(p));
    return query.lean().exec();
  }

  async findOne(filter, select = '') {
    return this._model.findOne(filter).select(select).lean().exec();
  }

  async find(filter = {}, options = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = PAGINATION.DEFAULT_SORT_BY,
      sortOrder = PAGINATION.DEFAULT_SORT_ORDER,
      populate = [],
      select = '',
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    let query = this._model.find(filter).skip(skip).limit(limit).sort(sort);
    if (select) query = query.select(select);
    populate.forEach((p) => (query = query.populate(p)));

    return query.lean().exec();
  }

  async create(data) {
    const doc = await this._model.create(data);
    return doc.toObject();
  }

  async updateById(id, data, options = { new: true, runValidators: true }) {
    return this._model.findByIdAndUpdate(id, { $set: data }, options).lean().exec();
  }

  async deleteById(id) {
    return this._model.findByIdAndDelete(id).lean().exec();
  }

  async count(filter = {}) {
    return this._model.countDocuments(filter);
  }

  async exists(filter) {
    return this._model.exists(filter);
  }

  async aggregate(pipeline) {
    return this._model.aggregate(pipeline);
  }

  async bulkCreate(dataArray) {
    return this._model.insertMany(dataArray);
  }

  async updateMany(filter, data) {
    return this._model.updateMany(filter, { $set: data });
  }

  async deleteMany(filter) {
    return this._model.deleteMany(filter);
  }
}

module.exports = BaseRepository;
