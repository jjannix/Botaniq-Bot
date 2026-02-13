const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Display information about a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get info about")
        .setRequired(false)
    )
    .setContexts(0),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor || "#5865F2")
      .setTitle(`User Info - ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "User ID", value: user.id, inline: true },
        { name: "Username", value: user.username, inline: true },
        { name: "Display Name", value: user.globalName || "None", inline: true }
      )
      .setTimestamp();

    if (member) {
      const roles = member.roles.cache
        .filter((role) => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map((role) => role.toString())
        .slice(0, 10)
        .join(" ") || "None";

      embed.addFields(
        { name: "Nickname", value: member.nickname || "None", inline: true },
        { name: "Joined Server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: `Roles [${member.roles.cache.size - 1}]`, value: roles.length > 1024 ? "Too many roles to display" : roles }
      );

      const badges = user.flags?.toArray() || [];
      if (badges.length > 0) {
        embed.addFields({ name: "Badges", value: badges.join(", "), inline: true });
      }
    } else {
      embed.addFields(
        { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      );
      embed.setFooter({ text: "User is not in this server" });
    }

    return interaction.reply({ embeds: [embed] });
  },
};
