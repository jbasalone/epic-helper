import {Client, PermissionsBitField, TextChannel} from 'discord.js';
import sendMessage from '../message/sendMessage';

const requiredPermissions = [PermissionsBitField.Flags.ManageRoles];

interface IUnMuteUser {
  userId: string;
  channelId: string;
  client: Client;
  removeUser?: boolean;
}

export const unMuteUser = async ({userId, client, channelId, removeUser}: IUnMuteUser) => {
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;
  if (!(channel instanceof TextChannel)) return;

  if (!channel.permissionsFor(client.user?.id ?? '')?.has(requiredPermissions)) {
    await sendMessage({
      channelId,
      client,
      options: {
        content:
          'I do not have permission to unmute this user. Please make sure I have the `Manage Roles` permission.',
      },
    });
    return;
  }

  if (removeUser) await channel.permissionOverwrites.delete(userId);
  else
    await channel.permissionOverwrites.edit(userId, {
      SendMessages: null,
    });
};
