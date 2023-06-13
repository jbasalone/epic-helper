import {Model, Schema} from 'mongoose';
import {IUserReminder} from './user-reminder.type';
import {RPG_FARM_SEED, RPG_WORKING_TYPE} from '../../constants/epic-rpg/rpg';
import redisUserReminder from '../../services/redis/user-reminder.redis';

const userReminderSchema = new Schema<IUserReminder>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {type: String, required: true},
    readyAt: {type: Date, required: true},
    props: {
      together: Boolean,
      hardMode: Boolean,
      ultraining: Boolean,
      epicQuest: Boolean,
      workingType: {
        type: String,
        enum: Object.values(RPG_WORKING_TYPE),
      },
      seedType: {
        type: String,
        enum: Object.values(RPG_FARM_SEED),
      },
      lootboxType: String,
    },
  },
  {
    statics: {
      findNextReadyAt(userId: string) {
        return this.find({userId, readyAt: {$gt: new Date()}})
          .sort({readyAt: 1})
          .limit(1);
      },
    },
  }
);

userReminderSchema.post('findOneAndUpdate', async function () {
  const updatedUserId = this.getQuery().userId;
  await updateNextReminderTime(updatedUserId, this.model);
});

userReminderSchema.post('deleteMany', async function () {
  const deletedUserId = this.getQuery().userId;
  await updateNextReminderTime(deletedUserId, this.model);
});

async function updateNextReminderTime(userId: string, model: Model<IUserReminder>) {
  const nextReminderTime = await model
    .find({
      userId,
    })
    .sort({readyAt: 1})
    .limit(1);
  if (nextReminderTime.length)
    await redisUserReminder.setReminderTime(userId, nextReminderTime[0].readyAt);
  else await redisUserReminder.deleteReminderTime(userId);
}

export default userReminderSchema;
