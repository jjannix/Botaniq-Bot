const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const warningsPath = path.join(__dirname, "..", "..", "data", "warnings.json");

function loadWarnings() {
  try {
    if (!fs.existsSync(warningsPath)) {
      fs.mkdirSync(path.dirname(warningsPath), { recursive: true });
      return {};
    }
    const data = fs.readFileSync(warningsPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[WARN] Error loading warnings file:", error.message);
    return {};
  }
}

function saveWarnings(warnings) {
  try {
    fs.mkdirSync(path.dirname(warningsPath), { recursive: true });
    fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
  } catch (error) {
    console.error("[WARN] Error saving warnings file:", error.message);
    throw error;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user for breaking rules.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the warning")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    try {
      const target = interaction.options.getMember("target");
      const reason = interaction.options.getString("reason") || "No reason provided";

      if (!target) {
        return interaction.reply({
          content: "Could not find that member in this server.",
          ephemeral: true,
        });
      }

      if (target.id === interaction.user.id) {
        return interaction.reply({
          content: "You cannot warn yourself!",
          ephemeral: true,
        });
      }

      if (target.user.bot) {
        return interaction.reply({
          content: "You cannot warn bots.",
          ephemeral: true,
        });
      }

      if (
        target.roles.highest.position >= interaction.member.roles.highest.position
      ) {
        return interaction.reply({
          content: "You cannot warn someone with an equal or higher role.",
          ephemeral: true,
        });
      }

      const warnings = loadWarnings();
      const guildId = interaction.guild.id;
      const userId = target.id;

      if (!warnings[guildId]) {
        warnings[guildId] = {};
      }
      if (!warnings[guildId][userId]) {
        warnings[guildId][userId] = [];
      }

      const warning = {
        id: randomUUID(),
        reason,
        moderator: interaction.user.tag,
        moderatorId: interaction.user.id,
        timestamp: Date.now(),
      };

      warnings[guildId][userId].push(warning);
      saveWarnings(warnings);

      const warningCount = warnings[guildId][userId].length;

      const embed = new EmbedBuilder()
        .setColor("#FFFF00")
        .setTitle("User Warned")
        .addFields(
          { name: "User", value: `${target.user.tag} (${target.id})`, inline: true },
          { name: "Warned By", value: `${interaction.user.tag}`, inline: true },
          { name: "Total Warnings", value: `${warningCount}`, inline: true },
          { name: "Reason", value: reason }
        )
        .setTimestamp();

      try {
        await target.user.send({
          content: `You have been warned in **${interaction.guild.name}**.\n**Reason:** ${reason}\n**Total Warnings:** ${warningCount}`,
        });
      } catch (dmError) {
        console.log(`[WARN] Could not DM user ${target.user.tag} about warning`);
        embed.setFooter({ text: "Could not DM user about this warning." });
      }

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`[WARN ERROR] ${interaction.commandName}:`, error);

      const errorMessage = "There was an error executing this command.";

      if (interaction.replied) {
        await interaction.followUp({
          content: errorMessage,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: errorMessage,
          ephemeral: true,
        });
      }
    }
  },
};
