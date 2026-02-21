// Classic Christian Hymns — KJV-era hymnal
// audioUrl: link to public domain audio (e.g. archive.org)
// For production, host your own MP3s in /public/hymns/

export const HYMNS = [
  {
    id: 1,
    title: 'Amazing Grace',
    author: 'John Newton, 1779',
    category: 'Grace',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    verses: [
      { number: 1, text: 'Amazing grace! how sweet the sound,\nThat saved a wretch like me!\nI once was lost, but now am found,\nWas blind, but now I see.' },
      { number: 2, text: "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed!" },
      { number: 3, text: 'Through many dangers, toils and snares,\nI have already come;\n\'Tis grace hath brought me safe thus far,\nAnd grace will lead me home.' },
      { number: 4, text: 'The Lord has promised good to me,\nHis Word my hope secures;\nHe will my Shield and Portion be,\nAs long as life endures.' },
      { number: 5, text: 'When we\'ve been there ten thousand years,\nBright shining as the sun,\nWe\'ve no less days to sing God\'s praise\nThan when we\'d first begun.' },
    ],
    chorus: null,
  },
  {
    id: 2,
    title: 'How Great Thou Art',
    author: 'Carl Boberg, 1885 / Stuart K. Hine, 1949',
    category: 'Praise',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    verses: [
      { number: 1, text: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.' },
      { number: 2, text: 'When through the woods and forest glades I wander\nAnd hear the birds sing sweetly in the trees,\nWhen I look down from lofty mountain grandeur\nAnd hear the brook and feel the gentle breeze.' },
      { number: 3, text: 'And when I think that God, His Son not sparing,\nSent Him to die, I scarce can take it in,\nThat on the cross, my burden gladly bearing,\nHe bled and died to take away my sin.' },
      { number: 4, text: 'When Christ shall come with shout of acclamation\nAnd take me home, what joy shall fill my heart!\nThen I shall bow in humble adoration\nAnd there proclaim, my God, how great Thou art!' },
    ],
    chorus: 'Then sings my soul, my Saviour God, to Thee:\nHow great Thou art, how great Thou art!\nThen sings my soul, my Saviour God, to Thee:\nHow great Thou art, how great Thou art!',
  },
  {
    id: 3,
    title: 'What a Friend We Have in Jesus',
    author: 'Joseph M. Scriven, 1855',
    category: 'Prayer',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    verses: [
      { number: 1, text: 'What a friend we have in Jesus,\nAll our sins and griefs to bear!\nWhat a privilege to carry\nEverything to God in prayer!\nO what peace we often forfeit,\nO what needless pain we bear,\nAll because we do not carry\nEverything to God in prayer!' },
      { number: 2, text: 'Have we trials and temptations?\nIs there trouble anywhere?\nWe should never be discouraged;\nTake it to the Lord in prayer!\nCan we find a friend so faithful\nWho will all our sorrows share?\nJesus knows our every weakness;\nTake it to the Lord in prayer!' },
      { number: 3, text: 'Are we weak and heavy laden,\nCumbered with a load of care?\nPrecious Saviour, still our refuge,\nTake it to the Lord in prayer!\nDo thy friends despise, forsake thee?\nTake it to the Lord in prayer!\nIn His arms He\'ll take and shield thee;\nThou wilt find a solace there.' },
    ],
    chorus: null,
  },
  {
    id: 4,
    title: 'Blessed Assurance',
    author: 'Fanny Crosby, 1873',
    category: 'Assurance',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    verses: [
      { number: 1, text: 'Blessed assurance, Jesus is mine!\nOh, what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.' },
      { number: 2, text: 'Perfect submission, perfect delight,\nVisions of rapture now burst on my sight;\nAngels descending bring from above\nEchoes of mercy, whispers of love.' },
      { number: 3, text: 'Perfect submission, all is at rest,\nI in my Saviour am happy and blest,\nWatching and waiting, looking above,\nFilled with His goodness, lost in His love.' },
    ],
    chorus: 'This is my story, this is my song,\nPraising my Saviour all the day long;\nThis is my story, this is my song,\nPraising my Saviour all the day long.',
  },
  {
    id: 5,
    title: 'Great Is Thy Faithfulness',
    author: 'Thomas O. Chisholm, 1923',
    category: 'Faithfulness',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    verses: [
      { number: 1, text: 'Great is Thy faithfulness, O God my Father,\nThere is no shadow of turning with Thee;\nThou changest not, Thy compassions, they fail not;\nAs Thou hast been Thou forever wilt be.' },
      { number: 2, text: 'Summer and winter, and springtime and harvest,\nSun, moon and stars in their courses above,\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love.' },
      { number: 3, text: 'Pardon for sin and a peace that endureth,\nThine own dear presence to cheer and to guide;\nStrength for today and bright hope for tomorrow,\nBlessings all mine, with ten thousand beside!' },
    ],
    chorus: 'Great is Thy faithfulness! Great is Thy faithfulness!\nMorning by morning new mercies I see;\nAll I have needed Thy hand hath provided;\nGreat is Thy faithfulness, Lord, unto me!',
  },
  {
    id: 6,
    title: 'To God Be the Glory',
    author: 'Fanny Crosby, 1875',
    category: 'Praise',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    verses: [
      { number: 1, text: 'To God be the glory, great things He hath taught us,\nGreat things He hath done, and great our rejoicing\nThrough Jesus the Son;\nBut purer, and higher, and greater will be\nOur wonder, our transport, when Jesus we see.' },
      { number: 2, text: 'O perfect redemption, the purchase of blood,\nTo every believer the promise of God;\nThe vilest offender who truly believes,\nThat moment from Jesus a pardon receives.' },
    ],
    chorus: 'Praise the Lord, praise the Lord,\nLet the earth hear His voice!\nPraise the Lord, praise the Lord,\nLet the people rejoice!\nO come to the Father, through Jesus the Son,\nAnd give Him the glory; great things He hath done.',
  },
  {
    id: 7,
    title: 'It Is Well with My Soul',
    author: 'Horatio Spafford, 1873',
    category: 'Peace',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    verses: [
      { number: 1, text: 'When peace like a river attendeth my way,\nWhen sorrows like sea billows roll;\nWhatever my lot, Thou hast taught me to say,\n"It is well, it is well with my soul."' },
      { number: 2, text: 'Though Satan should buffet, though trials should come,\nLet this blest assurance control,\nThat Christ hath regarded my helpless estate,\nAnd hath shed His own blood for my soul.' },
      { number: 3, text: 'My sin—oh, the bliss of this glorious thought!—\nMy sin, not in part, but the whole,\nIs nailed to the cross, and I bear it no more,\nPraise the Lord, praise the Lord, O my soul!' },
      { number: 4, text: 'And Lord, haste the day when the faith shall be sight,\nThe clouds be rolled back as a scroll;\nThe trump shall resound and the Lord shall descend,\n"Even so"—it is well with my soul.' },
    ],
    chorus: 'It is well (it is well)\nWith my soul (with my soul)\nIt is well, it is well with my soul.',
  },
  {
    id: 8,
    title: 'Rock of Ages',
    author: 'Augustus M. Toplady, 1776',
    category: 'Salvation',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    verses: [
      { number: 1, text: 'Rock of Ages, cleft for me,\nLet me hide myself in Thee;\nLet the water and the blood,\nFrom Thy riven side which flowed,\nBe of sin the double cure,\nSave me from its guilt and power.' },
      { number: 2, text: 'Not the labour of my hands\nCan fulfil Thy law\'s demands;\nCould my zeal no respite know,\nCould my tears forever flow,\nAll for sin could not atone;\nThou must save, and Thou alone.' },
      { number: 3, text: 'Nothing in my hand I bring,\nSimply to Thy cross I cling;\nNaked, come to Thee for dress;\nHelpless, look to Thee for grace;\nFoul, I to the fountain fly;\nWash me, Saviour, or I die.' },
    ],
    chorus: null,
  },
  {
    id: 9,
    title: 'Just As I Am',
    author: 'Charlotte Elliott, 1835',
    category: 'Salvation',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    verses: [
      { number: 1, text: 'Just as I am, without one plea,\nBut that Thy blood was shed for me,\nAnd that Thou bidd\'st me come to Thee,\nO Lamb of God, I come, I come.' },
      { number: 2, text: 'Just as I am, and waiting not\nTo rid my soul of one dark blot,\nTo Thee whose blood can cleanse each spot,\nO Lamb of God, I come, I come.' },
      { number: 3, text: 'Just as I am, though tossed about\nWith many a conflict, many a doubt,\nFightings and fears within, without,\nO Lamb of God, I come, I come.' },
      { number: 4, text: 'Just as I am, Thou wilt receive,\nWilt welcome, pardon, cleanse, relieve;\nBecause Thy promise I believe,\nO Lamb of God, I come, I come.' },
    ],
    chorus: null,
  },
  {
    id: 10,
    title: 'Holy, Holy, Holy',
    author: 'Reginald Heber, 1826',
    category: 'Worship',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    verses: [
      { number: 1, text: 'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy, merciful and mighty!\nGod in three Persons, blessèd Trinity!' },
      { number: 2, text: 'Holy, holy, holy! All the saints adore Thee,\nCasting down their golden crowns around the glassy sea;\nCherubim and seraphim falling down before Thee,\nWho was, and is, and evermore shall be.' },
      { number: 3, text: 'Holy, holy, holy! Though the darkness hide Thee,\nThough the eye of sinful man Thy glory may not see;\nOnly Thou art holy; there is none beside Thee,\nPerfect in power, in love, and purity.' },
      { number: 4, text: 'Holy, holy, holy! Lord God Almighty!\nAll Thy works shall praise Thy Name, in earth, and sky, and sea;\nHoly, holy, holy; merciful and mighty!\nGod in three Persons, blessèd Trinity!' },
    ],
    chorus: null,
  },
]

export const HYMN_CATEGORIES = ['All', ...new Set(HYMNS.map(h => h.category))]
