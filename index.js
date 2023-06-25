import 'dotenv/config';
import fetch from 'node-fetch';

// In the format of <@&123456>
const councillors = process.env.MENTION;
// Discord challen webhook url
const webhookURL = process.env.WEBHOOK_URL;
// DRY_RUN=1 for dry run
const dryrun = !!process.env.DRY_RUN;

const configs = {
    phala: {
        name: 'Phala',
        src: 'https://phala.subsquare.io/api/motions',
        link: 'https://phala.subsquare.io/council/motion',
    },
    khala: {
        name: 'Khala',
        src: 'https://khala.subsquare.io/api/motions',
        link: 'https://khala.subsquare.io/council/motion',
    },
};

function truncateText(text, maxLength = 300) {
    if (text.length <= maxLength) {
      return text;
    }
  
    const words = text.trim().split(/[\s\n]+/);
    let result = '';
    let currentLineLength = 0;
  
    for (const word of words) {
      const isNewLine = word === '\n';
      const wordLength = isNewLine ? 1 : word.length + 1;
  
      if ((result.length + wordLength) <= maxLength) {
        if (isNewLine) {
          result += '\n';
          currentLineLength = 0;
        } else {
          result += (currentLineLength ? ' ' : '') + word;
          currentLineLength += wordLength;
        }
      } else {
        break;
      }
    }
  
    return result.trim() + '...';
  }

async function checkMotions(chain, dryrun) {
    const { name, src, link } = configs[chain];
    const response = await fetch(src);
    const data = await response.json();
    const motions = data.items;
    
    const votingMotions = motions.filter(motion => ['Voting', 'Proposed'].includes(motion.state));
    
    if (votingMotions.length > 0) {
        const embeds = votingMotions.map(motion => {
            return {
                title: motion.title,
                description: truncateText(motion.content),
                url: `${link}/${motion.motionIndex}`
            };
        });
        
        const requestBody = {
            content: `${councillors} **${name} motions up for vote:**`,
            embeds: embeds
        };

        console.log(requestBody);
        
        if (!dryrun) {
            await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
        }
    }
}

async function main() {
    await checkMotions('khala', dryrun);
    await checkMotions('phala', dryrun);
}

main().then(() => process.exit()).catch(err => console.error(err)).finally(() => process.exit(-1));