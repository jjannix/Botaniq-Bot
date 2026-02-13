const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The member to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for kicking")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason provided";

    const target = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!target) {
      return interaction.reply({
        content: "Could not find that member in this server.",
        ephemeral: true,
      });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot kick yourself.",
        ephemeral: true,
      });
    }

    if (
      target.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content: "You cannot kick someone with an equal or higher role.",
        ephemeral: true,
      });
    }

    const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
    if (target.roles.highest.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: "I cannot kick someone with an equal or higher role than mine.",
        ephemeral: true,
      });
    }

    try {
      await target.kick(reason);

      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Member Kicked")
        .addFields(
          { name: "User", value: `${target.user.tag} (${target.id})`, inline: true },
          { name: "Kicked By", value: `${interaction.user.tag}`, inline: true },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error kicking the member.",
        ephemeral: true,
      });
    }
  },
};
