import { Devvit, useState } from '@devvit/public-api';
import { fetchStoryTopics } from './fetchStoryTopics.ts';

Devvit.configure({
  redditAPI: true,
  http: true,
});

Devvit.addMenuItem({
  label: 'Start Story Voting',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Fetching story topics...");

    try {
      const aiTopics = await fetchStoryTopics();

      const subreddit = await reddit.getCurrentSubreddit();
      const post = await reddit.submitPost({
        title: 'Vote for our next story theme!',
        subredditName: subreddit.name,
        preview: (
          <vstack height="100%" width="100%" alignment="middle center">
            <text size="large">Loading story vote...</text>
          </vstack>
        ),
      });

      ui.navigateTo(post);
    } catch (error) {
      console.error("Failed to fetch story topics:", error);
      ui.showToast("Failed to fetch story topics. Try again later.");
    }
  },
});

type StoryTopic = {
  title: string;
  description: string;
  votes: number;
};

Devvit.addCustomPostType({
  name: 'Story Topic Vote',
  height: 'regular',
  render: async (context) => {
    const [topics, setTopics] = useState<StoryTopic[]>([]);
    const [hasVoted, setHasVoted] = useState(false);

    async function loadTopics() {
      console.log("Loading story topics..."); // DEBUGGING
      try {
        const aiTopics = await fetchStoryTopics();
        console.log("Story topics fetched:", aiTopics); // DEBUGGING
        setTopics(aiTopics.map((topic) => ({ ...topic, votes: 0 })));
        console.log("Topics state updated"); // DEBUGGING
      } catch (error) {
        console.error("Failed to fetch story topics:", error);
      }
    }

    await loadTopics(); // Fetch topics before rendering

    const handleVote = (index: number) => {
      if (hasVoted) return;

      const newTopics = [...topics];
      newTopics[index].votes += 1;
      setTopics(newTopics);
      setHasVoted(true);
      context.ui.showToast(`Voted for ${newTopics[index].title}!`);
    };

    return (
      <vstack height="100%" width="100%" gap="medium" padding="medium">
        <text style="heading" size="xlarge" weight="bold">Choose Our Next Adventure!</text>
        <text>Vote for the story theme you want to see developed:</text>

        <hstack gap="medium" width="100%">
          {topics.map((topic, index) => (
            <vstack 
              backgroundColor="#1E1E1E" 
              cornerRadius="medium" 
              padding="medium" 
              gap="small"
              width="33%"
              borderColor="#333333"
              onPress={() => handleVote(index)}
              grow
            >
              <text style="heading" size="large" weight="bold">{topic.title}</text>
              <text color="#CCCCCC">{topic.description}</text>
              <spacer size="small" />
              <text color="#FF5700" weight="bold">
                {hasVoted ? `${topic.votes} votes` : 'Tap to vote'}
              </text>
            </vstack>
          ))}
        </hstack>
      </vstack>
    );
  },
});

export default Devvit;
