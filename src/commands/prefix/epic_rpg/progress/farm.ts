import {COMMAND_TYPE} from '../../../../constants/bot';
import {rpgFarm} from '../../../../lib/epic_rpg/commands/progress/farm';

export default <PrefixCommand>{
  name: 'rpgFarm',
  commands: ['farm'],
  type: COMMAND_TYPE.rpg,
  execute: async (client, message) => {
    rpgFarm({
      author: message.author,
      client,
      isSlashCommand: false,
      message,
    });
  },
};
