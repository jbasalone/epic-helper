import {mongoClient} from '@epic-helper/services';
import {guildSchema, IGuild} from '@epic-helper/models';
import {UpdateQuery} from 'mongoose';

const dbGuild = mongoClient.model('guilds', guildSchema);

interface IRegisterGuild {
  serverId: string;
  roleId: string;
  leaderId?: string;
}

const registerGuild = async ({serverId, roleId, leaderId}: IRegisterGuild): Promise<IGuild> => {
  return await dbGuild.create({
    serverId,
    roleId,
    leaderId,
  });
};

interface IIsRoleUsed {
  serverId: string;
  roleId: string;
}

const isRoleUsed = async ({serverId, roleId}: IIsRoleUsed): Promise<boolean> => {
  const guild = await dbGuild.findOne({serverId, roleId});
  return !!guild;
};

interface IFindGuild {
  serverId: string;
  roleId: string;
}

const findGuild = async ({serverId, roleId}: IFindGuild) => {
  return dbGuild.findOne({serverId, roleId});
};

interface IFindFirstGuild {
  serverId: string;
}

const findFirstGuild = async ({serverId}: IFindFirstGuild) => {
  return dbGuild.findOne({serverId});
};

interface IUpdateGuildReminder {
  serverId: string;
  roleId: string;
  channelId?: string;
  targetStealth?: number;
  upgradeMessage?: string;
  raidMessage?: string;
}

interface IGetAllGuilds {
  serverId: string;
}

const getAllGuilds = async ({serverId}: IGetAllGuilds) => {
  return dbGuild.find({serverId});
};

const updateGuildReminder = async ({
  serverId,
  roleId,
  channelId,
  targetStealth,
  upgradeMessage,
  raidMessage,
}: IUpdateGuildReminder): Promise<IGuild | null> => {
  const updateQuery: UpdateQuery<IGuild> = {
    $set: {},
  };

  if (channelId) {
    updateQuery.$set!['upgraid.channelId'] = channelId;
  }

  if (targetStealth !== undefined) {
    updateQuery.$set!['upgraid.targetStealth'] = targetStealth;
  }

  if (upgradeMessage) {
    updateQuery.$set!['upgraid.message.upgrade'] = upgradeMessage;
  }

  if (raidMessage) {
    updateQuery.$set!['upgraid.message.raid'] = raidMessage;
  }

  return dbGuild.findOneAndUpdate({serverId, roleId}, updateQuery, {
    new: true,
  });
};

interface ICalcTotalGuild {
  serverId: string;
}

const calcTotalGuild = async ({serverId}: ICalcTotalGuild) => {
  return dbGuild.countDocuments({serverId});
};

interface IDeleteGuild {
  serverId: string;
  roleId: string;
}

const deleteGuild = async ({serverId, roleId}: IDeleteGuild) => {
  return dbGuild.findOneAndDelete({serverId, roleId});
};

interface IUpdateLeader {
  serverId: string;
  roleId: string;
  leaderId: string;
}

const updateLeader = async ({serverId, roleId, leaderId}: IUpdateLeader) => {
  return dbGuild.findOneAndUpdate({serverId, roleId}, {$set: {leaderId}}, {new: true});
};

export const guildService = {
  registerGuild,
  isRoleUsed,
  findGuild,
  findFirstGuild,
  updateGuildReminder,
  calcTotalGuild,
  getAllGuilds,
  deleteGuild,
  updateLeader,
};
