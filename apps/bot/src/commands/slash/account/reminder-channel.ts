import djsInteractionHelper from '../../../lib/discordjs/interaction';
import {
  PREFIX,
  RPG_COMMAND_TYPE,
  RPG_WORKING_TYPE,
  USER_ACC_OFF_ACTIONS,
  USER_NOT_REGISTERED_ACTIONS,
} from '@epic-helper/constants';
import {userService} from '../../../services/database/user.service';
import {SLASH_COMMAND} from '../constant';

export default <SlashCommand>{
  name: SLASH_COMMAND.account.reminderChannel.name,
  description: SLASH_COMMAND.account.reminderChannel.description,
  type: 'subcommand',
  preCheck: {
    userAccOff: USER_ACC_OFF_ACTIONS.askToTurnOn,
    userNotRegistered: USER_NOT_REGISTERED_ACTIONS.askToRegister,
    donorOnly: true,
  },
  commandName: SLASH_COMMAND.account.name,
  builder: (subcommand) =>
    subcommand
      .addStringOption((option) =>
        option
          .setName('reminder-type')
          .setDescription(
            'Type of reminder, separate different type with space. e.g. hunt adv use',
          )
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName('action')
          .setDescription('Action to perform')
          .setRequired(true)
          .setChoices(
            {
              name: 'Set',
              value: 'set',
            },
            {
              name: 'Remove',
              value: 'remove',
            },
          ),
      ),
  execute: async (client, interaction) => {
    const optionReminderType = interaction.options.getString('reminder-type')!;
    const optionAction = interaction.options.getString('action', true) as
      | 'set'
      | 'remove';

    const reminderType = matchReminderType(optionReminderType);

    if (!reminderType.length)
      return djsInteractionHelper.replyInteraction({
        client,
        interaction,
        options: {
          content: `Invalid reminder type. Valid reminder types are: ${Object.keys(
            RPG_COMMAND_TYPE,
          )
            .map((i) => `\`${i}\``)
            .join(', ')}`,
        },
      });

    let message: string;

    switch (optionAction) {
      case 'set':
        await userService.setUserReminderChannel({
          channelId: interaction.channelId,
          userId: interaction.user.id,
          commandType: reminderType,
        });
        message = `Successfully set reminder channel for ${reminderType
          .map((i) => `\`${i}\``)
          .join(', ')} to this channel, Type \`${
          PREFIX.bot
        }s\` to view your settings`;
        break;
      case 'remove':
        await userService.removeUserReminderChannel({
          userId: interaction.user.id,
          commandType: reminderType,
        });
        message = `Successfully removed reminder channel for ${reminderType
          .map((i) => `\`${i}\``)
          .join(', ')} Type \`${PREFIX.bot}s\` to view your settings`;
        break;
    }

    await djsInteractionHelper.replyInteraction({
      client,
      interaction,
      options: {
        content: message,
      },
    });
  },
};

type IKeyword = Record<keyof typeof RPG_COMMAND_TYPE, string[]>;

const keyWords: IKeyword = {
  adventure: ['adventure', 'adv'],
  hunt: ['hunt'],
  arena: ['arena'],
  daily: ['daily'],
  duel: ['duel'],
  dungeon: ['dungeon', 'miniboss'],
  farm: ['farm'],
  horse: ['horse', 'horse breed', 'horse race'],
  lootbox: ['lootbox', 'buy'],
  pet: ['pet', 'pets'],
  quest: ['quest', 'epic quest'],
  epicItem: ['use', 'epic items', 'epic item', 'epicItems', 'epicItem'],
  training: ['training', 'tr'],
  vote: ['vote'],
  weekly: ['weekly'],
  working: ['working', ...Object.keys(RPG_WORKING_TYPE)],
  xmasChimney: ['xmasChimney', 'xmas chimney', 'chimney'],
};

const matchReminderType = (reminderType: string) => {
  const reminderTypeLower = reminderType.toLowerCase();

  const matched: (keyof IKeyword)[] = [];
  for (const key in keyWords) {
    const _key = key as keyof typeof keyWords;
    if (
      keyWords[_key].some((keyword) =>
        reminderTypeLower.includes(keyword.toLowerCase()),
      )
    ) {
      if (!matched.includes(_key)) {
        matched.push(_key);
      }
    }
  }

  return matched;
};
