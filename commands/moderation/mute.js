const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { parseDuration } = require("../../utils/time");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout a user for a specified duration.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to mute")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the mute (e.g., 1m, 1h, 1d)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the mute")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const member = interaction.options.getMember("target");
    const durationString = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") || "No reason provided";

    if (!member) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true,
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot mute yourself.",
        ephemeral: true,
      });
    }

    if (
      member.roles.highest.position >= interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content: "You cannot mute someone with an equal or higher role.",
        ephemeral: true,
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: "I cannot timeout this user. They may have a higher role than me.",
        ephemeral: true,
      });
    }

    const duration = parseDuration(durationString);
    if (!duration) {
      return interaction.reply({
        content: "Invalid duration format. Use formats like: 1m, 1h, 1d, or combine them (e.g., 1h30m).",
        ephemeral: true,
      });
    }

    const maxTimeout = 2419200000;
    if (duration > maxTimeout) {
      return interaction.reply({
        content: "Duration exceeds maximum timeout of 28 days.",
        ephemeral: true,
      });
    }

    try {
      await member.timeout(duration, reason);

      const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("Member Muted")
        .addFields(
          { name: "User", value: `${member.user.tag} (${member.id})`, inline: true },
          { name: "Muted By", value: `${interaction.user.tag}`, inline: true },
          { name: "Duration", value: durationString, inline: true },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Failed to mute the user. Check my permissions and role hierarchy.",
        ephemeral: true,
      });
    }
  },
};
