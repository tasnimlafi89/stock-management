import "./global.css"
import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { AuthView, UserButton } from '@clerk/expo/native'
import { Bell, Compass, Heart, LayoutDashboard, ShoppingBasket, ShoppingCart } from 'lucide-react-native'
import { registerForPushNotificationsAsync } from './src/lib/pushNotifications'
import ExploreScreen from './src/screens/ExploreScreen'
import BasketScreen from './src/screens/BasketScreen'
import ProductDetailScreen from './src/screens/ProductDetailScreen'
import FavoritesScreen from './src/screens/FavoritesScreen'
import MyProductsScreen from './src/screens/MyProductsScreen'
import CategoryScreen from './src/screens/CategoryScreen'
import NewProductScreen from './src/screens/NewProductScreen'
import EditProductScreen from './src/screens/EditProductScreen'
import ActivityScreen from './src/screens/ActivityScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import * as SplashScreen from 'expo-splash-screen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import OnboardingScreen from './src/screens/OnboardingScreen'


SplashScreen.preventAutoHideAsync()

const RootStack = createNativeStackNavigator()
const Tabs = createBottomTabNavigator()
const MyShopStack = createNativeStackNavigator()

const HomeStack = createNativeStackNavigator()

function HomeNavigator() {
    return (
        <HomeStack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
            <HomeStack.Screen name="Explore" component={ExploreScreen} />
        </HomeStack.Navigator>
    )
}

function MyShopNavigator() {
    return (

        <MyShopStack.Navigator screenOptions={{ headerShown: true }}>
            <MyShopStack.Screen name="MyProducts" component={MyProductsScreen} options={{ headerShown: false }} />
            <MyShopStack.Screen name="Categories" component={CategoryScreen} options={{ title: '' }} />
            <MyShopStack.Screen name="NewProduct" component={NewProductScreen} options={{ title: '' }} />
            <MyShopStack.Screen name="EditProduct" component={EditProductScreen} options={{ title: '' }} />
        </MyShopStack.Navigator>
    )
}


function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets()
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#D8DEE9',
                paddingBottom: insets.bottom + 8,
                paddingTop: 8,
                paddingHorizontal: 8,
            }}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key]
                const isFocused = state.index === index
                const color = isFocused ? '#5E81AC' : '#4C566A'
                const label = (options.tabBarLabel as string) ?? route.name

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    })
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name)
                    }
                }

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={{ flex: 1, alignItems: 'center', gap: 2 }}
                    >
                        {options.tabBarIcon?.({ color, size: 22, focused: isFocused })}
                        <Text style={{ color, fontSize: 11 }}>{label}</Text>
                    </TouchableOpacity>
                )
            })}

            <View
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginRight: 4,
                }}
            >
                <UserButton />
            </View>
        </View>
    )
}
function MainTabs() {
    return (
        <Tabs.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#5E81AC',
                tabBarInactiveTintColor: '#4C566A',
            }}
        >
            <Tabs.Screen
                name="Home"
                component={HomeNavigator}
                options={({ route }) => {
                    const focusedRoute = getFocusedRouteNameFromRoute(route) ?? 'Dashboard'
                    const isOnDashboard = focusedRoute === 'Dashboard'
                    return {
                        tabBarLabel: isOnDashboard ? 'Explorer' : 'Accueil',
                        tabBarIcon: ({ color, size }) =>
                            isOnDashboard
                                ? <Compass color={color} size={size} />
                                : <LayoutDashboard color={color} size={size} />,
                    }
                }}
                listeners={({ navigation, route }) => ({
                    tabPress: (e) => {
                        e.preventDefault()
                        const focusedRoute = getFocusedRouteNameFromRoute(route) ?? 'Dashboard'
                        const target = focusedRoute === 'Dashboard' ? 'Explore' : 'Dashboard'
                        navigation.navigate('Home', { screen: target })
                    },
                })}
            />
            <Tabs.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favoris',
                    tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="Basket"
                component={BasketScreen}
                options={{
                    tabBarLabel: 'Panier',
                    tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="MyShop"
                component={MyShopNavigator}
                options={{
                    tabBarLabel: 'Produits',
                    tabBarIcon: ({ color, size }) => <ShoppingBasket color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="Activity"
                component={ActivityScreen}
                options={{
                    tabBarLabel: 'Activité',
                    tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
                }}
            />
        </Tabs.Navigator>
    )
}
function AppNavigator() {
    const { isLoaded, isSignedIn, getToken } = useAuth({ treatPendingAsSignedOut: false })
    const [onboardingChecked, setOnboardingChecked] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
            setShowOnboarding(value !== 'true')
            setOnboardingChecked(true)
        })
    }, [])

    useEffect(() => {
        if (isLoaded && onboardingChecked) {
            SplashScreen.hideAsync()
        }
    }, [isLoaded, onboardingChecked])

    useEffect(() => {
        if (!isSignedIn) return
        const register = async () => {
            const pushToken = await registerForPushNotificationsAsync()
            if (!pushToken) return
            const token = await getToken()
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/push-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ pushToken }),
            })
        }
        register()
    }, [isSignedIn])

    if (!isLoaded || !onboardingChecked) {
        return null
    }

    if (showOnboarding) {
        return <OnboardingScreen onDone={() => setShowOnboarding(false)} />
    }

    if (!isSignedIn) {
        return <AuthView mode="signInOrUp" />
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="MainTabs" component={MainTabs} />
                <RootStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true, title: '' }} />
            </RootStack.Navigator>
        </NavigationContainer>
    )
}
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function App() {
    return (
        <SafeAreaProvider>
            <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
                <AppNavigator />
            </ClerkProvider>
        </SafeAreaProvider>
    )
}