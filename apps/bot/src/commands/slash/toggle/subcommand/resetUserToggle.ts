import type {IToggleSubcommand} from '../toggle.type';
import commandHelper from '../../../../lib/epic-helper/command-helper';
import djsInteractionHelper from '../../../../lib/discordjs/interaction';
import {userService} from '../../../../services/database/user.service';

export const resetUserToggleSlash = async ({client, interaction}: IToggleSubcommand) => {
  const userAccount = await userService.resetUserToggle({
    userId: interaction.user.id,
  });
  if (!userAccount) return;

  const embed = commandHelper.toggle.getDonorToggleEmbed({
    author: interaction.user,
    userAccount,
  });
  await djsInteractionHelper.replyInteraction({
    client,
    interaction,
    options: {
      embeds: [embed],
    },
  });
};
