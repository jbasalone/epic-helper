import {IGuildSubCommand} from './type';
import {guildService} from '../../../../services/database/guild.service';
import djsInteractionHelper from '../../../../lib/discordjs/interaction';
import commandHelper from '../../../../lib/epic-helper/command-helper';

export const guildUpdateReminder = async ({client, interaction}: IGuildSubCommand) => {
  const role = interaction.options.getRole('role', true);
  const channel = interaction.options.getChannel('channel');
  const targetStealth = interaction.options.getNumber('target-stealth');
  const upgradeMessage = interaction.options.getString('upgrade-message') ?? undefined;
  const raidMessage = interaction.options.getString('raid-message') ?? undefined;

  const isRoleUsed = await guildService.isRoleUsed({
    serverId: interaction.guildId!,
    roleId: role.id,
  });
  if (!isRoleUsed) {
    return djsInteractionHelper.replyInteraction({
      client,
      interaction,
      options: {
        content: `There is no guild with role ${role} setup in this server`,
        ephemeral: true,
      },
    });
  }

  const updatedGuild = await guildService.updateGuildReminder({
    channelId: channel?.id,
    targetStealth: targetStealth === null ? undefined : targetStealth,
    upgradeMessage,
    raidMessage,
    serverId: interaction.guildId!,
    roleId: role.id,
  });
  if (!updatedGuild) return;
  await djsInteractionHelper.replyInteraction({
    client,
    interaction,
    options: {
      embeds: [
        commandHelper.guildSettings.renderGuildSettingsEmbed({
          guildAccount: updatedGuild!,
        }),
      ],
    },
  });
};
