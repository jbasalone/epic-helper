import {Client, Message, User} from 'discord.js';
import {ADVENTURE_MONSTER_LIST} from '../../../../constants/monster';
import {
  saveUserAdventureCooldown,
  updateUserCooldown,
} from '../../../../models/user-reminder/user-reminder.service';
import {COMMAND_BASE_COOLDOWN} from '../../../../constants/command_base_cd';
import {calcReducedCd} from '../../../../utils/epic_rpg/calcReducedCd';
import {RPG_COMMAND_TYPE} from '../../../../constants/rpg';
import {createRpgCommandListener} from '../../createRpgCommandListener';
import {CLICKABLE_SLASH_RPG} from '../../../../constants/clickable_slash';
import {getUserHealReminder} from '../../../../models/user/user.service';
import sendMessage from '../../../discord.js/message/sendMessage';

interface IRpgAdventure {
  client: Client;
  message: Message;
  author: User;
  isSlashCommand: boolean;
}

export function rpgAdventure({client, message, author, isSlashCommand}: IRpgAdventure) {
  const event = createRpgCommandListener({
    channelId: message.channel.id,
    author,
    client,
  });
  if (!event) return;
  event.on('content', (content) => {
    if (isRpgAdventureSuccess({author, content})) {
      rpgAdventureSuccess({
        author,
        client,
        channelId: message.channel.id,
        content,
      });
      healReminder({
        client,
        author,
        content,
        channelId: message.channel.id,
      });
      event.stop();
    }
  });
  event.on('cooldown', (cooldown) => {
    updateUserCooldown({
      userId: author.id,
      type: RPG_COMMAND_TYPE.adventure,
      readyAt: new Date(Date.now() + cooldown),
    });
  });
  if (isSlashCommand) event.triggerCollect(message);
}

interface IRpgAdventureSuccess {
  client: Client;
  channelId: string;
  author: User;
  content: Message['content'];
}

const ADVENTURE_COOLDOWN = COMMAND_BASE_COOLDOWN.adventure;

export default async function rpgAdventureSuccess({author, content}: IRpgAdventureSuccess) {
  const hardMode = content.includes('(but stronger)');

  const cooldown = await calcReducedCd({
    userId: author.id,
    commandType: RPG_COMMAND_TYPE.adventure,
    cooldown: ADVENTURE_COOLDOWN,
  });
  await saveUserAdventureCooldown({
    userId: author.id,
    hardMode,
    readyAt: new Date(Date.now() + cooldown),
  });
}

interface IHealReminder {
  client: Client;
  channelId: string;
  author: User;
  content: Message['content'];
}

async function healReminder({client, channelId, author, content}: IHealReminder) {
  const healReminder = await getUserHealReminder({
    userId: author.id,
  });
  if (!healReminder) return;
  const healReminderMsg = await getHealReminderMsg({content, target: healReminder});
  if (!healReminderMsg) return;
  sendMessage({
    channelId,
    options: {
      content: author + healReminderMsg,
    },
    client,
  });
}

interface ISuccessChecker {
  content: string;
  author: User;
}

export function isRpgAdventureSuccess({author, content}: ISuccessChecker) {
  return (
    content.includes(author.username) &&
    ADVENTURE_MONSTER_LIST.some((monster) => content.includes(monster))
  );
}

interface IGetHealReminderMsg {
  content: Message['content'];
  target: number | undefined;
}

export async function getHealReminderMsg({
  content,
  target,
}: IGetHealReminderMsg): Promise<string | void> {
  let hp: string | undefined;
  let hpLost: string | undefined;
  let horseSaved = false;
  let dead = false;
  if (content.includes('but lost fighting')) {
    //player lost
    dead = true;
    if (content.includes('saved you before the enemy')) horseSaved = true;
  } else if (content.includes('found and killed')) {
    hp = content
      .split('\n')
      .find((msg) => msg.includes('remaining HP'))
      ?.split('HP is')[1]
      .trim()
      .split('/')[0];
    hpLost = content
      .split('\n')
      .find((msg) => msg.includes('remaining HP'))
      ?.split('HP')[0]
      .split(' ')[1];
  }
  let msg;
  if (horseSaved) {
    msg = `Your horse saved you from dying, ${CLICKABLE_SLASH_RPG.heal} yourself now`;
  } else if (Number(hpLost) && Number(hpLost) >= Number(hp)) {
    msg = `It's hard to kill the next monster, Time to ${CLICKABLE_SLASH_RPG.heal} now`;
  } else if (dead) {
    return;
  } else if (hpLost && Number(hpLost) !== 0) {
    // user is damaged
    if (target && Number(hp) <= Number(target))
      msg = `Your HP is getting low. Time to ${CLICKABLE_SLASH_RPG.heal} now`;
  }
  return msg;
}
