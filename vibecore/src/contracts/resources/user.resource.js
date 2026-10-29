export const toUserResource = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    profile: user.profile
      ? {
          id: user.profile.id,
          fullname: user.profile.fullname,
          image: user.profile.image,
          age: user.profile.age,
          nationality: user.profile.nationality,
          gender: user.profile.gender,
        }
      : null,
    createdAt: user.createdAt,
  };
};
