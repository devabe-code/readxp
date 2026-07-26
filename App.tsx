import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

type Book = {
  id: string;
  title: string;
  author: string;
  year: string;
  genre: string;
  excerpt: string;
  hook: string;
  palette: [string, string, string];
  accent: string;
  likes: string;
  saves: string;
  readTime: string;
};

type Tab = 'home' | 'discover' | 'library' | 'profile';

const BOOKS: Book[] = [
  {
    id: 'gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: '1925',
    genre: 'Modern Classic',
    excerpt:
      'In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.\n\n“Whenever you feel like criticizing any one,” he told me, “just remember that all the people in this world haven’t had the advantages that you’ve had.”',
    hook: 'A glittering summer. An impossible love.',
    palette: ['#071D22', '#164B54', '#D6A648'],
    accent: '#F4C568',
    likes: '128K',
    saves: '24K',
    readTime: '22 sec',
  },
  {
    id: 'pride',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: '1813',
    genre: 'Romance',
    excerpt:
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families...',
    hook: 'Enemies first. Everything else later.',
    palette: ['#1D1018', '#663A53', '#E89AB8'],
    accent: '#FFB9CF',
    likes: '211K',
    saves: '46K',
    readTime: '19 sec',
  },
  {
    id: 'moby',
    title: 'Moby-Dick',
    author: 'Herman Melville',
    year: '1851',
    genre: 'Adventure',
    excerpt:
      'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
    hook: 'One captain. One whale. One obsession.',
    palette: ['#061522', '#123C5A', '#3A87A8'],
    accent: '#8DD8F2',
    likes: '96K',
    saves: '18K',
    readTime: '15 sec',
  },
  {
    id: 'frankenstein',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    year: '1818',
    genre: 'Gothic',
    excerpt:
      'It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.',
    hook: 'He wanted to create life. He created a monster.',
    palette: ['#0B140F', '#284A31', '#96A345'],
    accent: '#D1DC75',
    likes: '173K',
    saves: '35K',
    readTime: '21 sec',
  },
];

function ActionButton({
  icon,
  activeIcon,
  label,
  active,
  color = '#FFFFFF',
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <View style={[styles.actionIcon, active && { backgroundColor: 'rgba(255,90,61,0.18)' }]}>
        <Ionicons name={active && activeIcon ? activeIcon : icon} size={28} color={active ? '#FF6548' : color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function BookSlide({
  book,
  height,
  liked,
  saved,
  onLike,
  onSave,
}: {
  book: Book;
  height: number;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
}) {
  return (
    <View style={[styles.slide, { height }]}>
      <LinearGradient colors={book.palette} locations={[0, 0.58, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.texture}>
        <View style={[styles.glow, { backgroundColor: book.accent }]} />
        <View style={styles.grainLine} />
        <View style={[styles.grainLine, styles.grainLineTwo]} />
      </View>
      <LinearGradient
        colors={['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.08)', 'rgba(5,5,8,0.94)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.excerptWrap}>
        <View style={[styles.genrePill, { borderColor: `${book.accent}70` }]}>
          <View style={[styles.genreDot, { backgroundColor: book.accent }]} />
          <Text style={styles.genreText}>{book.genre.toUpperCase()}</Text>
        </View>
        <Text style={styles.openQuote}>“</Text>
        <Text style={styles.excerpt}>{book.excerpt}</Text>
        <View style={styles.readMeta}>
          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.62)" />
          <Text style={styles.readMetaText}>{book.readTime} read</Text>
        </View>
      </View>

      <View style={styles.bottomContent}>
        <View style={styles.bookInfo}>
          <Text style={[styles.hook, { color: book.accent }]} numberOfLines={1}>
            {book.hook}
          </Text>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>
            {book.author} <Text style={styles.year}>· {book.year}</Text>
          </Text>
          <Pressable style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
            <Text style={styles.continueText}>Continue reading</Text>
            <Ionicons name="arrow-forward" size={16} color="#111114" />
          </Pressable>
        </View>

        <View style={styles.actions}>
          <ActionButton
            icon="heart-outline"
            activeIcon="heart"
            active={liked}
            label={liked ? 'Liked' : book.likes}
            onPress={onLike}
          />
          <ActionButton
            icon="bookmark-outline"
            activeIcon="bookmark"
            active={saved}
            label={saved ? 'Saved' : book.saves}
            onPress={onSave}
          />
          <ActionButton icon="chatbubble-ellipses-outline" label="842" />
          <ActionButton icon="arrow-redo-outline" label="Share" />
        </View>
      </View>
    </View>
  );
}

function Header({ activeIndex, total }: { activeIndex: number; total: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>R</Text>
        </View>
        <Text style={styles.logo}>ReadXP</Text>
      </View>
      <View style={styles.feedTabs}>
        <Pressable>
          <Text style={styles.feedTabMuted}>Following</Text>
        </Pressable>
        <Pressable>
          <Text style={styles.feedTabActive}>For You</Text>
          <View style={styles.feedUnderline} />
        </Pressable>
      </View>
      <Pressable accessibilityLabel="Search" style={styles.searchButton}>
        <Ionicons name="search" size={23} color="#FFF" />
      </Pressable>
      <View style={styles.progressRail}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[styles.progressSegment, index === activeIndex && styles.progressSegmentActive]}
          />
        ))}
      </View>
    </View>
  );
}

function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const insets = useSafeAreaInsets();
  const items: { id: Tab; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap; label: string }[] =
    [
      { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
      { id: 'discover', icon: 'compass-outline', activeIcon: 'compass', label: 'Discover' },
      { id: 'library', icon: 'library-outline', activeIcon: 'library', label: 'Library' },
      { id: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
    ];

  return (
    <BlurView intensity={55} tint="dark" style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.map((item) => {
        const selected = active === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={styles.navItem}
          >
            <Ionicons name={selected ? item.activeIcon : item.icon} size={23} color={selected ? '#FFFFFF' : '#7C7D84'} />
            <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{item.label}</Text>
            {selected && <View style={styles.navDot} />}
          </Pressable>
        );
      })}
    </BlurView>
  );
}

function PlaceholderScreen({ tab, savedCount }: { tab: Exclude<Tab, 'home'>; savedCount: number }) {
  const content = {
    discover: ['compass-outline', 'Discover your next obsession', 'Fresh genres, moods, and hidden classics are waiting.'],
    library: ['library-outline', 'Your reading shelf', `${savedCount} ${savedCount === 1 ? 'excerpt' : 'excerpts'} saved for later.`],
    profile: ['person-circle-outline', 'Your reader era starts here', 'Build streaks, collect badges, and track every page.'],
  } as const;
  const [icon, title, body] = content[tab];
  return (
    <LinearGradient colors={['#171719', '#09090B']} style={styles.placeholder}>
      <View style={styles.placeholderOrb} />
      <Ionicons name={icon} size={54} color="#FF6548" />
      <Text style={styles.placeholderEyebrow}>READXP</Text>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderBody}>{body}</Text>
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>COMING NEXT</Text>
      </View>
    </LinearGradient>
  );
}

function ReadXPApp() {
  const { height } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('home');
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());

  const toggleItem = useCallback(
    (id: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setter((current) => {
        const next = new Set(current);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 65 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Book>[] }) => {
      const nextIndex = viewableItems[0]?.index;
      if (typeof nextIndex === 'number') setActiveIndex(nextIndex);
    },
  ).current;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Book>) => (
      <BookSlide
        book={item}
        height={height}
        liked={likedIds.has(item.id)}
        saved={savedIds.has(item.id)}
        onLike={() => toggleItem(item.id, setLikedIds)}
        onSave={() => toggleItem(item.id, setSavedIds)}
      />
    ),
    [height, likedIds, savedIds, toggleItem],
  );

  const keyExtractor = useMemo(() => (item: Book) => item.id, []);

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      {tab === 'home' ? (
        <>
          <FlatList
            data={BOOKS}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={height}
            snapToAlignment="start"
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          />
          <Header activeIndex={activeIndex} total={BOOKS.length} />
        </>
      ) : (
        <PlaceholderScreen tab={tab} savedCount={savedIds.size} />
      )}
      <BottomNav active={tab} onChange={setTab} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ReadXPApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#09090B' },
  slide: { overflow: 'hidden', backgroundColor: '#111' },
  texture: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', opacity: 0.28 },
  glow: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    top: 80,
    right: -170,
    opacity: 0.34,
    transform: [{ scaleX: 1.3 }],
  },
  grainLine: {
    position: 'absolute',
    width: '140%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    top: '34%',
    left: '-20%',
    transform: [{ rotate: '-18deg' }],
  },
  grainLineTwo: { top: '46%', opacity: 0.5, transform: [{ rotate: '-25deg' }] },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 126,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FF5A3D',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
  },
  logoLetter: { color: '#FFF', fontSize: 15, fontWeight: '900', transform: [{ rotate: '5deg' }] },
  logo: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: -0.7 },
  feedTabs: { flexDirection: 'row', gap: 20, alignItems: 'flex-start', marginTop: 10 },
  feedTabMuted: { color: 'rgba(255,255,255,0.58)', fontSize: 15, fontWeight: '600' },
  feedTabActive: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  feedUnderline: { alignSelf: 'center', width: 18, height: 3, borderRadius: 2, backgroundColor: '#FF5A3D', marginTop: 7 },
  searchButton: { marginTop: 7, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  progressRail: { position: 'absolute', left: 18, right: 18, bottom: 5, flexDirection: 'row', gap: 5 },
  progressSegment: { flex: 1, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  progressSegmentActive: { backgroundColor: '#FFF' },
  excerptWrap: { position: 'absolute', left: 24, right: 66, top: '20%' },
  genrePill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 15,
  },
  genreDot: { width: 5, height: 5, borderRadius: 3 },
  genreText: { color: 'rgba(255,255,255,0.82)', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  openQuote: { color: 'rgba(255,255,255,0.22)', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 72, lineHeight: 62, height: 46 },
  excerpt: {
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 21,
    lineHeight: 31,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  readMeta: { marginTop: 14, flexDirection: 'row', gap: 6, alignItems: 'center' },
  readMetaText: { color: 'rgba(255,255,255,0.62)', fontSize: 12, fontWeight: '600' },
  bottomContent: {
    position: 'absolute',
    left: 20,
    right: 12,
    bottom: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bookInfo: { flex: 1, paddingRight: 10 },
  hook: { fontSize: 12, fontWeight: '800', letterSpacing: 0.15, marginBottom: 5 },
  title: { color: '#FFF', fontSize: 22, lineHeight: 25, fontWeight: '900', letterSpacing: -0.7 },
  author: { color: 'rgba(255,255,255,0.76)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  year: { color: 'rgba(255,255,255,0.43)' },
  continueButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 15,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueText: { color: '#111114', fontSize: 12, fontWeight: '800' },
  actions: { width: 56, alignItems: 'center', gap: 9, paddingBottom: 1 },
  action: { alignItems: 'center' },
  actionIcon: {
    width: 45,
    height: 41,
    borderRadius: 23,
    backgroundColor: 'rgba(16,16,18,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { color: '#FFF', fontSize: 10, fontWeight: '700', marginTop: 2, textShadowColor: '#000', textShadowRadius: 5 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.96 }] },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 76,
    paddingTop: 9,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 3 },
  navLabel: { color: '#7C7D84', fontSize: 10, fontWeight: '600' },
  navLabelActive: { color: '#FFF', fontWeight: '800' },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF5A3D', marginTop: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 38, overflow: 'hidden' },
  placeholderOrb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,90,61,0.08)',
    top: '18%',
  },
  placeholderEyebrow: { color: '#FF6548', fontSize: 11, fontWeight: '900', letterSpacing: 2.2, marginTop: 20 },
  placeholderTitle: { color: '#FFF', fontSize: 30, lineHeight: 35, fontWeight: '900', textAlign: 'center', letterSpacing: -1.1, marginTop: 8 },
  placeholderBody: { color: '#9A9AA1', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12 },
  comingSoon: { borderWidth: 1, borderColor: '#343438', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginTop: 25 },
  comingSoonText: { color: '#898990', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
});
