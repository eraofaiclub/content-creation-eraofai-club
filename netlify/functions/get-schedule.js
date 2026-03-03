const { Client } = require('@notionhq/client');

exports.handler = async function(event, context) {
  const notion = new Client({ auth: process.env.NOTION_API_KEY || 'ntn_g28948461327bqvUEnchwubmPkUTFQ866eI2WAXfnejeyd' });
  const databaseId = process.env.NOTION_DATABASE_ID || '3180ac8bd8b4807c9a54e702a898d12b';

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Day',
          direction: 'ascending',
        },
      ],
    });

    const days = response.results.map((page) => {
      const props = page.properties;
      
      // Extract values based on column types (assuming standard types)
      const day = props.Day?.number || props.Day?.title?.[0]?.plain_text || 0;
      const title = props.Title?.title?.[0]?.plain_text || props.Title?.rich_text?.[0]?.plain_text || 'Untitled';
      const tools = props.Tools?.multi_select?.map(o => o.name).join(', ') || props.Tools?.rich_text?.[0]?.plain_text || '';
      const prompts = props.Prompts?.rich_text?.[0]?.plain_text || '';
      const ytLink = props['YouTube Link']?.url || '';
      const unlocked = props.Unlocked?.checkbox || false;

      // Determine status
      let status = 'upcoming';
      if (unlocked) {
        status = ytLink ? 'done' : 'live';
      }
      
      // Map to frontend structure
      return {
        t: title,
        d: tools + (prompts ? ` - ${prompts}` : ''),
        s: status,
        link: ytLink,
        dayNum: day
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(days),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data', details: error.message }),
    };
  }
};
