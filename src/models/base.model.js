const { Model, DataTypes } = require('sequelize');

class BaseModel extends Model {
  /**
   * Common model options
   */
  static getOptions() {
    return {
      timestamps: true,
      underscored: true,
      paranoid: false // Disable soft deletes by default
    };
  }

  /**
   * Common model hooks
   */
  static getHooks() {
    return {
      beforeCreate: (instance) => {
        if (!instance.active && instance.active !== false) {
          instance.active = true;
        }
      }
    };
  }

  /**
   * Common model validations
   */
  static getValidations() {
    return {
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      }
    };
  }

  /**
   * Initialize model with common options
   * @param {object} attributes - Model attributes
   * @param {object} options - Additional options
   */
  static init(attributes, options = {}) {
    const modelOptions = {
      ...this.getOptions(),
      ...options,
      hooks: {
        ...this.getHooks(),
        ...(options.hooks || {})
      }
    };

    const modelAttributes = {
      ...this.getValidations(),
      ...attributes
    };

    return super.init(modelAttributes, modelOptions);
  }

  /**
   * Paginate results
   * @param {object} options - Query options
   * @returns {Promise<object>} Paginated results
   */
  static async paginate(options = {}) {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));
    const offset = (page - 1) * limit;

    const { count, rows } = await this.findAndCountAll({
      ...options,
      limit,
      offset
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Find by id with error handling
   * @param {number|string} id - Record ID
   * @param {object} options - Query options
   */
  static async findByIdOrFail(id, options = {}) {
    const record = await this.findByPk(id, options);
    if (!record) {
      throw new Error(`${this.name} not found with id: ${id}`);
    }
    return record;
  }
}

module.exports = BaseModel; 