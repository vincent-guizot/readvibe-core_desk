'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Extend books table
    await queryInterface.changeColumn('books', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('books', 'isbn', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('books', 'googleBooksId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('books', 'previewLink', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('books', 'embeddable', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    // 2. Create mood_tags table
    await queryInterface.createTable('mood_tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      icon: {
        type: Sequelize.STRING,
      },
      color: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 3. Create book_moods table
    await queryInterface.createTable('book_moods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      moodTagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mood_tags',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 4. Create editorial_picks table
    await queryInterface.createTable('editorial_picks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tagline: {
        type: Sequelize.STRING,
      },
      curatorNotes: {
        type: Sequelize.TEXT,
      },
      curationWeight: {
        type: Sequelize.INTEGER,
        defaultValue: 50,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 5. Create wishlists table
    await queryInterface.createTable('wishlists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      priority: {
        type: Sequelize.STRING,
        defaultValue: 'Medium',
      },
      reason: {
        type: Sequelize.TEXT,
      },
      visibility: {
        type: Sequelize.STRING,
        defaultValue: 'Public',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 6. Create reading_activities table
    await queryInterface.createTable('reading_activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'Want to Read',
      },
      startDate: {
        type: Sequelize.DATE,
      },
      finishDate: {
        type: Sequelize.DATE,
      },
      rating: {
        type: Sequelize.INTEGER,
      },
      quote: {
        type: Sequelize.TEXT,
      },
      privateNote: {
        type: Sequelize.TEXT,
      },
      publicReview: {
        type: Sequelize.TEXT,
      },
      moodTag: {
        type: Sequelize.STRING,
      },
      isSpoiler: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isFlagged: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      flagReason: {
        type: Sequelize.STRING,
      },
      moderationStatus: {
        type: Sequelize.STRING,
        defaultValue: 'Approved',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reading_activities');
    await queryInterface.dropTable('wishlists');
    await queryInterface.dropTable('editorial_picks');
    await queryInterface.dropTable('book_moods');
    await queryInterface.dropTable('mood_tags');
    await queryInterface.removeColumn('books', 'embeddable');
    await queryInterface.removeColumn('books', 'previewLink');
    await queryInterface.removeColumn('books', 'googleBooksId');
    await queryInterface.removeColumn('books', 'isbn');
  },
};
