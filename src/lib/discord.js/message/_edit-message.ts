import {Client, DiscordAPIError, Message, MessageEditOptions, MessagePayload} from 'discord.js';
import {logger} from '../../../utils/logger';

interface EditMessageProps {
  client: Client;
  message: Message;
  options: string | MessagePayload | MessageEditOptions;
}

export default async function _editMessage({client, message, options}: EditMessageProps) {
  if (message.author.id !== client.user?.id) return;
  if (!message.editable) return;
  try {
    await message.edit(options);
  } catch (e: DiscordAPIError | any) {
    logger({
      client,
      message: e.rawError.message,
      variant: 'edit-message',
      logLevel: 'warn',
    });
  }
}
