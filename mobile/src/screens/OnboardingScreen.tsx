import { useRef, useState } from 'react'
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import PagerView from 'react-native-pager-view'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width } = Dimensions.get('window')

const slides = [
    {
        image: require('../../assets/onboarding-1.png'),
        title: 'Gérez votre stock',
    },
    {
        image: require('../../assets/onboarding-2.png'),
        title: 'Explorez et échangez',
    },
    {
        image: require('../../assets/onboarding-3.png'),
        title: 'Suivez vos ventes',
        descrption: "Consultez votre tableau de bord pour voir vos meilleures ventes et votre stock faible.",
    },
]

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
    const pagerRef = useRef<PagerView>(null)
    const [page, setPage] = useState(0)

    const finish = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true')
        onDone()
    }

    const next = () => {
        if (page < slides.length - 1) {
            pagerRef.current?.setPage(page + 1)
        } else {
            finish()
        }
    }

    return (
        <View className="flex-1 bg-base100">
            <PagerView
                ref={pagerRef}
                style={{ flex: 1 }}
                initialPage={0}
                onPageSelected={(e) => setPage(e.nativeEvent.position)}
            >
                {slides.map((slide, index) => (
                    <View key={index} className="flex-1 items-center justify-center px-8">
                        <Image source={slide.image} style={{ width: width * 0.75, height: width * 0.75 }} resizeMode="contain" />
                        <Text className="text-2xl font-bold text-baseContent mt-8 text-center">{slide.title}</Text>
                    </View>
                ))}
            </PagerView>

            <View className="flex-row justify-center gap-2 mb-6">
                {slides.map((_, index) => (
                    <View
                        key={index}
                        className="h-2 rounded-full"
                        style={{
                            width: page === index ? 24 : 8,
                            backgroundColor: page === index ? '#5E81AC' : '#F6F9FE',
                        }}
                    />
                ))}
            </View>

            <View className="flex-row justify-between items-center px-8 mb-10">
                <TouchableOpacity onPress={finish}>
                    <Text className="text-neutral">Passer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={next} className="bg-primary rounded-full px-6 py-3">
                    <Text className="text-primaryContent font-semibold">
                        {page === slides.length - 1 ? 'Commencer' : 'Suivant'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}