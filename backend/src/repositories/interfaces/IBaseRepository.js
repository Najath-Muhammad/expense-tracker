/**
 * IBaseRepository - Abstract base repository interface
 * All repositories must implement these methods
 */
class IBaseRepository {
  async findById(id) { throw new Error('findById() not implemented'); }
  async findOne(filter) { throw new Error('findOne() not implemented'); }
  async find(filter, options) { throw new Error('find() not implemented'); }
  async create(data) { throw new Error('create() not implemented'); }
  async updateById(id, data) { throw new Error('updateById() not implemented'); }
  async deleteById(id) { throw new Error('deleteById() not implemented'); }
  async count(filter) { throw new Error('count() not implemented'); }
  async exists(filter) { throw new Error('exists() not implemented'); }
}

module.exports = IBaseRepository;
