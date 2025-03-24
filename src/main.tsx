import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Start Story Voting',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Creating story topic vote post...");

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
  },
});

// Story topic type
type StoryTopic = {
  title: string;
  description: string;
  votes: number;
};

// Add a post type definition for the voting cards
Devvit.addCustomPostType({
  name: 'Story Topic Vote',
  height: 'regular',
  render: (context) => {
    const [topics, setTopics] = useState<StoryTopic[]>([
      {
        title: 'Lost in Cyberspace',
        description: 'A hacker gets trapped in a virtual world where the internet becomes a physical maze.',
        votes: 0
      },
      {
        title: 'The Last Library',
        description: 'In a future where books are banned, a group protects the last remaining library.',
        votes: 0
      },
      {
        title: 'Time Tourist',
        description: 'A malfunctioning time machine sends tourists to random moments in history.',
        votes: 0
      }
    ]);
    const [hasVoted, setHasVoted] = useState(false);

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
              // border="solid"
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

        {hasVoted && (
          <button onPress={() => context.ui.showToast(`Winning topic: ${getWinningTopic(topics).title}`)}>
            Show Winning Topic
          </button>
        )}
      </vstack>
    );
  },
});

function getWinningTopic(topics: StoryTopic[]): StoryTopic {
  return topics.reduce((prev, current) => 
    (prev.votes > current.votes) ? prev : current
  );
}

export default Devvit;