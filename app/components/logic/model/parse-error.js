export default function ParseError({
  langId, string, message, location, language = null,
}) {
  this.langId = langId;
  this.string = string;
  this.message = message;
  this.location = location;
  this.language = language;
};
